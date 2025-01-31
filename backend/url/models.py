from django.db import models
from django.contrib.auth.models import User
from django.contrib.sites.models import Site
# Create your models here.

class ShortenedURL(models.Model):
    original_url = models.URLField()
    short_url = models.CharField(max_length=20, unique=True, blank=True)
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


    def get_short_url(self):
        if self.short_url:  # Check if short_url is not empty
            current_domain = Site.objects.get_current().domain
            return f'http://{current_domain}/{self.short_url}'
        else:
            return '' 
    def __str__(self):
        return self.original_url