from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import redirect, get_object_or_404
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse, HttpRequest
from .models import ShortenedURL
from .serializers import ShortenedURLSerializer
from .utils import generate_short_url, generate_qr_code



@api_view(['POST'])
def shorten_url(request):
    if not request.user.is_authenticated:
        # User is not authenticated, handle with session
        session_key = request.session.session_key
        if not session_key:
            request.session.save()
            session_key = request.session.session_key

        if 'shortened_count' not in request.session:
            request.session['shortened_count'] = 0

        if request.session['shortened_count'] >= 2:
            return Response({'error': 'Sign In to generate more links'}, status=status.HTTP_403_FORBIDDEN)

        # Generate short URL and save in session
        original_url = request.data.get('original_url')
        short_url = generate_short_url(original_url)

        if 'shortened_urls' not in request.session:
            request.session['shortened_urls'] = {}

        request.session['shortened_urls'][short_url] = original_url
        request.session['shortened_count'] += 1

        return Response({'short_url': short_url})

    else:
        # User is authenticated, handle with database
        original_url = request.data.get('original_url')

        try:
            shortened_url = ShortenedURL.objects.get(original_url=original_url)
            if not shortened_url.short_url:
                shortened_url.short_url = generate_short_url(original_url)
                shortened_url.save()

            serializer = ShortenedURLSerializer(shortened_url)
            return Response(serializer.data)

        except ShortenedURL.DoesNotExist:
            shortened_url = ShortenedURL.objects.create(
                original_url=original_url,
                short_url=generate_short_url(original_url),
                created_by=request.user
            )

            serializer = ShortenedURLSerializer(shortened_url)
            return Response(serializer.data)

@api_view(['POST'])
def generate_code(request):
    if not request.user.is_authenticated:
        return Response({'error':'Sign in to generate QR Codes'}, status=status.HTTP_403_FORBIDDEN)
    else:
        original_url = request.data.get('original_url')
        try:
            shortened_url = ShortenedURL.objects.get(original_url = original_url)
            if not shortened_url.qr_code:
                shortened_url.qr_code = generate_qr_code(original_url)
                shortened_url.save()
            serializer = ShortenedURLSerializer(shortened_url)
            return Response(serializer.data)
        except ShortenedURL.DoesNotExist:
            generated_code = ShortenedURL.objects.create(
                original_url = original_url,
                qr_code = generate_qr_code(original_url),
                created_by = request.user
            )
            serializer = ShortenedURLSerializer(generate_code)
            return Response(serializer.data)



def redirect_to_original_url(request, short_url):
    if not request.user.is_authenticated:
        if 'shortened_urls' in request.session:
            shortened_urls = request.session['shortened_urls']
            if short_url in shortened_urls:
                original_url = shortened_urls[short_url]
                print(f"Original URL: {original_url}")
                return redirect(original_url)

    print(f"Received short code: {short_url}")
    # Retrieve the ShortenedURL object associated with the provided short_code
    shortened_url = get_object_or_404(ShortenedURL, short_url=short_url)
    print(f"Found ShortenedURL: {shortened_url}")
    # Perform the redirection to the original URL
    return redirect(shortened_url.original_url)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_shortened_url(request, pk):
    try:
        shortened_url = ShortenedURL.objects.get(pk=pk)
    except ShortenedURL.DoesNotExist:
        return Response({'error': 'ShortenedURL not found'}, status=status.HTTP_404_NOT_FOUND)

    # Check if the user is the creator of the ShortenedURL or has appropriate permissions
    if shortened_url.created_by != request.user:
        return Response({'error': 'You are not authorized to update this ShortenedURL'}, status=status.HTTP_403_FORBIDDEN)

    serializer = ShortenedURLSerializer(shortened_url, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_shortened_urls(request):
    if not request.user.is_authenticated:
        session_shortened_urls = request.session.get('shortened_urls', [])
        return JsonResponse({'shortened_urls': session_shortened_urls})
    
    else:
        user_shortened_urls = ShortenedURL.objects.filter(created_by=request.user)
        serializer = ShortenedURLSerializer(user_shortened_urls, many=True)
        return JsonResponse(serializer.data, safe=False)