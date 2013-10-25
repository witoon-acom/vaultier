from rest_framework.fields import SerializerMethodField, EmailField, BooleanField, IntegerField
from rest_framework.relations import PrimaryKeyRelatedField
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer, Serializer
from rest_framework.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST
from rest_framework.viewsets import ModelViewSet
from core.api.user import RelatedUserSerializer
from core.api.workspace import RelatedWorkspaceSerializer
from core.auth import TokenAuthentication
from core.models.member import Member
from core.models.workspace import Workspace


class MemberSerializer(ModelSerializer):
    created_by = RelatedUserSerializer(required=False)
    email = SerializerMethodField('get_email')
    nickname = SerializerMethodField('get_nickname')
    user = RelatedUserSerializer(required=False)
    workspace = RelatedWorkspaceSerializer()

    def get_email(self, obj):
        if obj:
            if (obj.status == 'i'):
                return obj.invitation_email
            else:
                return obj.user.email

    def get_nickname(self, obj):
        if obj:
            if (obj.status == 'i'):
                return obj.invitation_email
            else:
                return obj.user.nickname

    class Meta:
        model = Member
        fields = ('id', 'status', 'email', 'nickname', 'workspace', 'user', 'created_by', 'created_at', 'updated_at')


class Related(PrimaryKeyRelatedField):
    def from_native(self, data):
        result = super(Related, self).from_native(data)
        print result
        return result



class MemberInviteSerializer(Serializer):
    email = EmailField(required=True)
    workspace = Related(required=True, queryset=Workspace.objects.all())
    send = BooleanField(required=False, default=True)
    resend = BooleanField(required=False, default=True)


class MemberViewSet(ModelViewSet):
    model = Member
    serializer_class = MemberSerializer
    authentication_classes = (TokenAuthentication,)

    def create(self, request, *args, **kwargs):
        serializer = MemberInviteSerializer(data=request.DATA)
        if serializer.is_valid():
            print serializer.data.get('email')
            #todo: validate workspace id agaist object level permissions
            member = Member.objects.invite(
                user=request.user,
                workspace=serializer.object.get('workspace'),
                email=serializer.object.get('email'),
                send=serializer.object.get('send'),
                resend=serializer.object.get('resend')
            )

            return Response(
                MemberSerializer(member).data,
                status=HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

    def pre_save(self, object):
        if object.pk is None:
            object.created_by = self.request.user;
        return super(MemberViewSet, self).pre_save(object)

    def get_queryset(self):
        queryset = Member.objects.all()
        return queryset

