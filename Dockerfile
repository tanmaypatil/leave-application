# Base image
FROM node:10-alpine
 
# installes required packages for our script
RUN apk add --no-cache \
  bash \
  ca-certificates \
  curl \
  docker \
  wget 

EXPOSE 8080
# Copies your code file  repository to the filesystem
COPY entrypoint.sh /entrypoint.sh
ENV RUSTUP_HOME=/rust
ENV CARGO_HOME=/cargo 
ENV PATH=/cargo/bin:/rust/bin:$PATH
 
# change permission to execute the script and
RUN chmod +x /entrypoint.sh
 
# file to execute when the docker container starts up
ENTRYPOINT ["/entrypoint.sh"]