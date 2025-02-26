'use strict';

Vaultier.Member = RL.Model.extend(
    Vaultier.CreatedUpdatedMixin,
    {
        status: RL.attr('number'),
        email: RL.attr('string'),
        nickname: RL.attr('string'),
        user: RL.attr('object'),
        workspace: RL.attr('object'),
        roles_count: RL.attr('number'),

        statuses: new Utils.ConstantList({
            'INVITED': {
                value: 100,
                text: 'INVITED'
            },
            'MEMBER_WITHOUT_WORKSPACE_KEY': {
                value: 200,
                text: 'MEMBER_WITHOUT_WORKSPACE_KEY'
            },
            'MEMBER': {
                value: 300,
                text: 'MEMBER'
            }
        }),

        /**
         * @return {Boolean}
         */
        isNotMember: function () {
            return this.get('status') !== this.get('statuses')['MEMBER'].value;
        }.property('status'),

        isInvited: function () {
            return this.get('status') === this.get('statuses')['INVITED'].value;
        }.property('status'),

        /**
         * @return {Boolean}
         */
        hasNokey: function () {
            return this.get('status') === this.get('statuses')['MEMBER_WITHOUT_WORKSPACE_KEY'].value;
        }.property('status')

    });


