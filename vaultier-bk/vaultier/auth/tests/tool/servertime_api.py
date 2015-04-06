import os
from django.core.urlresolvers import reverse
from rest_framework.test import APIClient

def get_servertime_api_call(*args, **kwargs):
    url = reverse('servertime')
    client = APIClient()
    response = client.get(url, kwargs)
    return response
