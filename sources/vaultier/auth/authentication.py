import time
from Crypto.Hash import SHA
from Crypto.PublicKey import RSA
from Crypto.Signature import PKCS1_v1_5
from base64 import b64decode
from datetime import datetime, timedelta
from dateutil import parser as dateparser
from django.utils import timezone
from django.contrib.auth.backends import ModelBackend
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from vaultier.models import Token, User


class TokenAuthentication(BaseAuthentication):
    def authenticate(self, request):

        from vaultier.models import Token

        token = request.META.get('HTTP_X_VAULTIER_TOKEN')

        if token == None or token == '' or token == 'null':
            return (None)

        try:
            model = Token.objects.get(token=token)
            """:type : Token"""
            token_renewal_interval = settings.VAULTIER.get('authentication_token_renewal_interval')
            # convert to seconds
            token_renewal_interval *= 60

            td = timezone.now() - model.last_used_at
            if td.total_seconds() > token_renewal_interval:
                model.last_used_at = timezone.now()
                model.save()
        except Token.DoesNotExist:
            raise AuthenticationFailed('Invalid token')

        if not model.user.is_active:
            raise AuthenticationFailed('User inactive or deleted')

        return (model.user, token)


class Backend(ModelBackend):
    @classmethod
    def verify(self, public_key, content, date, signature):
        signature = b64decode(signature)
        key = RSA.importKey(public_key)
        h = SHA.new(content + str(date))
        verifier = PKCS1_v1_5.new(key)
        return verifier.verify(h, signature)

    @classmethod
    def sign(self, private_key, content, timestamp):
        key = RSA.importKey(private_key)
        h = SHA.new()
        h.update(content + str(timestamp))
        signer = PKCS1_v1_5.new(key)
        sig = signer.sign(h)
        return sig.encode('base64')

    def authenticate(self, email=None, date=None, signature=None):

        # verify timestamp
        try:
            date = dateparser.parse(date)
            safe_delta = settings.BK_FEATURES.get('login_safe_timestamp_delta')
            safe_until = date + timedelta(seconds=safe_delta)
            now = timezone.now()

            if safe_until < now:
                raise Exception('Login timestamp to old')
        except:
            return None

        # check database for user
        try:
            user = User.objects.get(email=email.lower())
        except User.DoesNotExist:
            return None

        # verify signature
        if self.verify(user.public_key, email, date, signature):
            token = Token(user=user)
            token.save()
            return token

        return None

    def get_user(self, user_id):
        from vaultier.models import User

        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
