from rest_framework import serializers
from .models import ShortenedURL
from .utils import generate_short_url, generate_qr_code

class ShortenedURLSerializer(serializers.ModelSerializer):
    short_url = serializers.SerializerMethodField()
    class Meta:
        model = ShortenedURL
        fields = ['id', 'original_url', 'short_url', 'qr_code', 'created_by']
    
    def get_short_url(self, obj):
        return obj.get_short_url() 
    
    def update(self, instance, validated_data):
        instance.original_url = validated_data.get('original_url', instance.original_url)
        
        # Update short_url if original_url is changed
        if 'original_url' in validated_data:
            instance.short_url = generate_short_url(instance.original_url)
        
        # Update qr_code if original_url is changed
        if 'original_url' in validated_data:
            instance.qr_code = generate_qr_code(instance.original_url)
        
        instance.save()
        return instance