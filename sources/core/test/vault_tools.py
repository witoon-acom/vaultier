from django.core.urlresolvers import reverse
from core.test.tools import VaultierAPIClient

def create_vault_api_call(token, **kwargs):
    url = reverse('vault-list')
    client = VaultierAPIClient()
    client.token(token)
    response = client.post(url, kwargs)
    return response


def delete_vault_api_call(token, id):
    url = reverse('vault-detail', args=(id,))
    client = VaultierAPIClient()
    client.token(token)
    response = client.delete(url)
    return response


def list_vaults_api_call(token, workspace=None):
    url = reverse('vault-list')
    client = VaultierAPIClient()
    client.token(token)

    data = {}
    if (workspace):
        data['workspace'] = workspace

    response = client.get(url, **data)
    return response