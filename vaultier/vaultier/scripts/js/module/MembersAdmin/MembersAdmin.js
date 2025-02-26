Vaultier.MembersAdminRoute = Ember.Route.extend(
    Vaultier.MembersAdminListActionsMixin,
    {
        model: function (params, transition) {
            var store = this.get('store');

            var workspace = this.modelFor('Workspace');

            if (!this.get('auth').checkPermissions(transition, function () {
                return workspace.get('perms.update')
            }.bind(this), true)) {
                return;
            }

            var members = store
                .find('Member', { workspace: workspace.get('id')})

            var queries = {
                workspace: workspace,
                members: members
            };
            return  Ember.RSVP.hash(queries);
        },

        setupController: function (ctrl, model) {
            ctrl.set('content', model.members);
            ctrl.set('workspace', model.workspace)
            ctrl.set('breadcrumbs',
                Vaultier.Breadcrumbs.create({router: this.get('router'), environment: this.get('environment')})
                    .addHome()
                    .addWorkspace()
                    .addText('Members of workspace')
            );
        }

    }
);


Vaultier.MembersAdminController = Ember.Controller.extend({

    invitedMembers: function () {
        return Ember.ArrayProxy.createWithMixins(
            Ember.SortableMixin,
            {
                sortProperties: ['nickname'],
                content: this.get('content').filter(function (item, index, enumerable) {
                    return item.get('status') == Vaultier.Member.proto().statuses.INVITED.value;
                })
            })
    }.property('content.@each', 'content.@each.status'),

    membersWithoutKeys: function () {
        return Ember.ArrayProxy.createWithMixins(
            Ember.SortableMixin,
            {
                sortProperties: ['nickname'],
                content: this.get('content').filter(function (item, index, enumerable) {
                    return item.get('status') == Vaultier.Member.proto().statuses.MEMBER_WITHOUT_WORKSPACE_KEY.value;
                })
            })
    }.property('content.@each', 'content.@each.status'),

    concreteMembers: function () {
        return Ember.ArrayProxy.createWithMixins(
            Ember.SortableMixin,
            {
                sortProperties: ['nickname'],
                content: this.get('content').filter(function (item, index, enumerable) {
                    return item.get('status') == Vaultier.Member.proto().statuses.MEMBER.value;
                })
            })
    }.property('content.@each', 'content.@each.status')



});


Vaultier.MembersAdminView = Em.View.extend({
    layoutName: 'Layout/LayoutStandard',
    templateName: 'MembersAdmin/MembersAdmin'
});



