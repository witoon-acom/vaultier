Vaultier.RolesAdminInviteInput = Ember.Component.extend({
    classNames: ['vaultier-roles-admin-invite-input'],

    value: null,

    store: null,

    auth: null,

    workspace: null,

    tagName: "input",

    didInsertElement: function () {

        if (!this.store) {
            throw 'RolesAdminInviteInput requires store to autocomplete. Inject store to component as store=store'
        }
        if (!this.workspace) {
            throw 'RolesAdminInviteInput requires workspace to autocomplete. Inject workspace to component as workspace=workspace'
        }
        if (!this.auth) {
            throw 'RolesAdminInviteInput requires auth service to autocomplete. Inject auth to component as auth=auth'
        }

        var el = Ember.$(this.get('element'));

        var ajaxQueryContext = {};

        function validateEmail(email) {
            // http://stackoverflow.com/a/46181/11236
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }


        var ajaxQuery = function () {
            var members = this.store.find('Member', {
                workspace: Utils.E.recordId(this.workspace),
                search: this.query.term,
                ordering: '-status'
            })
                .then(function (members) {
                    var results = [];
                    members.forEach(function (member) {
                        var invitation = member.get('status') == member.statuses['INVITED'].value;

                        // do not include current user
                        if (member.get('user') != this.auth.get('user.id')) {
                            results.push({
                                invitation: invitation,
                                text: member.get('email'),
                                id: invitation ? member.get('email') : member.get('id'),
                                nickname: member.get('nickname'),
                                email: member.get('email')
                            });
                        }
                    }.bind(this));
                    this.query.callback({results: results});
                }.bind(this))
        };


        el.select2({
            tokenSeparators: [",", " ", ";"],
            createSearchChoice: function (term, data) {
                var add = true;
                data.forEach(function (member) {
                    if (term == member.id) {
                        add = false;
                        return false;
                    }
                });

                if (!validateEmail(term)) {
                    add = false;
                }

                if (add) {
                    return {
                        invitation: true,
                        text: term,
                        nickname: term,
                        email: term.toLowerCase(),
                        id: term.toLowerCase()
                    }
                }
            },
            multiple: true,
            query: function (query) {
                ajaxQueryContext.store = this.get('controller.store')
                ajaxQueryContext.query = query;
                ajaxQueryContext.auth = this.get('auth')
                ajaxQueryContext.workspace = this.get('workspace')
                Ember.run.debounce(ajaxQueryContext, ajaxQuery, 500);

            }.bind(this),

            formatResult: function (member) {
                var str = Utils.HandlebarsHelpers.current().printUser(member, {
                    hash: {
                        disableTooltip: true,
                        displayEmailInsideBrackets: !member.invitation
                    }
                });
                if (member.invitation) {

                    str = 'Invite <b>' + str + '</b>'
                } else {
                    str = 'grant to <b>' + str + '</b>'
                }
                return str
            },

            formatSelection: function (member) {
                var str = Utils.HandlebarsHelpers.current().printUser(member, {hash: {disableTooltip: true}});
                if (member.invitation) {
                    str = 'Invite <b>' + str + '</b>'
                } else {
                    str = 'grant to <b>' + str + '</b>'
                }
                return str
            }

        });

        el.on('change', function (e) {
            this.set('value', e.val)
        }.bind(this));

    }

});
