Vaultier.CardRolesAdminIndexRoute = Vaultier.RolesAdminIndexRoute.extend(
    Vaultier.WorkspaceKeysMixin,
    {
        beforeModel: function () {
            this.checkWorkspaceKeys();
        },

        setupInviteData: function (params) {
            var card = this.modelFor('Card');
            return {
                inviteObject: card
            };
        },

        setupBlocks: function () {
            return {workspace: true, vault: true, card: true};
        },

        setupBreadcrumbs: function () {
            return Vaultier.Breadcrumbs.create({router: this.get('router'), environment: this.get('environment')})
                .addHome()
                .addWorkspace()
                .addVault()
                .addCard()
                .addRolesAdminIndex('Card.rolesAdminIndex');
        },

        setupInviteRoute: function (models) {
            return {
                inviteRouteName: 'Card.rolesAdminInvite'
            };
        },

        setupRoleLevels: function () {
            var levels = Vaultier.Role.proto().roles.toArray().filter(function (item, index) {
                if (item.id == 'CREATE') {
                    return false;
                }
                return item;
            });
            return levels;
        }
    });


Vaultier.CardRolesAdminIndexController = Vaultier.RolesAdminIndexController.extend({
});


Vaultier.CardRolesAdminInviteRoute = Vaultier.RolesAdminInviteRoute.extend(
    Vaultier.WorkspaceKeysMixin,
    {
        beforeModel: function () {
            this.checkWorkspaceKeys();
        },


        setupInviteData: function (params) {
            var card = this.modelFor('Card');
            var workspace = this.modelFor('Workspace');
            return {
                inviteObject: card,
                inviteParams: { to_card: card},
                inviteWorkspace: workspace
            }
        },

        setupBreadcrumbs: function () {
            return Vaultier.Breadcrumbs.create({router: this.get('router'), environment: this.get('environment')})
                .addHome()
                .addWorkspace()
                .addVault()
                .addCard()
                .addRolesAdminIndex('Card.rolesAdminIndex')
                .addRolesAdminInvite('Card.rolesAdminInvite');
        },

        setupRoleLevels: function () {
            var levels = Vaultier.Role.proto().roles.toArray().filter(function (item, index) {
                if (item.id == 'CREATE') {
                    return false;
                }
                return item;
            });
            return levels;
        }

    });

Vaultier.CardRolesAdminInviteController = Vaultier.RolesAdminInviteController.extend({
});
