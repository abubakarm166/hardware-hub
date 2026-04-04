#!/usr/bin/env sh
# Production entry (Docker / Railway). Static files: built into image + WhiteNoise at runtime.
set -e
python manage.py migrate --noinput
python manage.py collectstatic --noinput
python manage.py bootstrap_admin
if [ "$SEED_DUMMY_DATA" = "1" ] || [ "$SEED_DUMMY_DATA" = "true" ] || [ "$SEED_DUMMY_DATA" = "yes" ]; then
  python manage.py seed_dummy_data
fi
exec gunicorn config.wsgi:application --bind "0.0.0.0:${PORT:-8000}"
