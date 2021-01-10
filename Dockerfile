# Base image
FROM node:10-alpine
 
# installes required packages for our script
RUN apk add --no-cache \
  bash \
  ca-certificates \
  curl \
  wget 


# Copies your code file  repository to the filesystem
COPY entrypoint.sh /entrypoint.sh
 
# change permission to execute the script and
RUN chmod +x /entrypoint.sh
 
# file to execute when the docker container starts up
ENTRYPOINT ["/entrypoint.sh"]