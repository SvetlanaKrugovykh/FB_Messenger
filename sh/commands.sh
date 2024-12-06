& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -c "CREATE DATABASE fb_messages WITH ENCODING='UTF8' LC_COLLATE='uk_UA.utf8' LC_CTYPE='uk_UA.utf8' TEMPLATE=template0;"

#=============================================
#!/bin/sh

# Ensure the locale is available (uncomment to run)
# locale -a | grep ru_RU.UTF-8

# Create the database with a locale that supports Cyrillic characters
psql -U postgres -h localhost -c "CREATE DATABASE fb_messages WITH ENCODING='UTF8' LC_COLLATE='ru_RU.UTF-8' LC_CTYPE='ru_RU.UTF-8' TEMPLATE=template0;"

#=============================================
pg_dump -U postgres -d fb_messages -h localhost -p 5432 > fb_m_$(date +\%Y-\%m-\%d).sql
