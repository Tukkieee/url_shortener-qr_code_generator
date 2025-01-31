from django.shortcuts import render
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    # The redirect URI you set on Google - https://127.0.0.1:8000/accounts/google/login/callback/
    callback_url = "http://localhost:5173/"
    client_class = OAuth2Client

