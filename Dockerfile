FROM node:10-alpine

WORKDIR /home/

COPY package.json .
COPY pnpm-lock.yaml .
COPY package-lock.json .

RUN apk update && \
    apk add --no-cache \
        git \
        g++ \
        make \
        python3 && \
    npm install && \
    npm install async

FROM provable/ptokens-nodejs-base:1.1-alpine

LABEL maintainer="Provable Things Ltd <info@provable.xyz>" \
    description="pTokens erc777 smart contract bytecode generator"

ENV FOLDER_SYNC $HOME/sync
ENV GENERATOR_PATH $HOME/generator

RUN mkdir -p $FOLDER_SYNC && \
    mkdir -p $GENERATOR_PATH/build && \
    chown -R provable:provable $HOME

WORKDIR $GENERATOR_PATH

COPY --chown=provable:provable --from=0 \
    /home/node_modules \
    ./node_modules

COPY --chown=provable:provable lib lib
COPY --chown=provable:provable contracts contracts
COPY --chown=provable:provable migrations migrations

COPY --chown=provable:provable *.* ./

USER provable

VOLUME $GENERATOR_PATH/build
VOLUME $FOLDER_SYNC

ENTRYPOINT ["./setup.sh"]