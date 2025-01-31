import hashlib
import qrcode
import uuid
from io import BytesIO
from django.core.files import File


def generate_short_url(original_url, length=6):
    # Generate MD5 hash of the original URL
    hash_digest = hashlib.md5(original_url.encode()).hexdigest()

    # Take the first 'length' characters of the hash digest
    short_length = hash_digest[:length]
    short_url = short_length
    
    return short_url

def generate_qr_code(original_url):
    # Generate a unique random filename based on the long URL
    random_filename = str(uuid.uuid4())[:8]
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(original_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill='black', back_color='white')

    # Save QR code image to BytesIO buffer
    buffer = BytesIO()
    qr_img.save(buffer, format='PNG')

    # Create and return Django File object
    qr_code_file = File(buffer, name=f'{random_filename}.png')
    return qr_code_file
