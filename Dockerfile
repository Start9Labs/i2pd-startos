FROM alpine:edge@sha256:020dfcbaaf4cc1078bf2d9c7ba31a8466e334061dcd2f248001d68f79e52c000

ARG I2PD_VERSION=3.0.0-r0

RUN apk add --no-cache i2pd=${I2PD_VERSION}

USER i2pd
ENTRYPOINT ["i2pd"]
CMD ["--conf=/etc/i2pd/i2pd.conf", "--datadir=/var/lib/i2pd"]
