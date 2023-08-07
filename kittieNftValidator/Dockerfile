FROM nginx/unit:1.23.0-python3.9
RUN apt update && apt install -y python3-pip                                  

COPY ./config/config.json /docker-entrypoint.d/config.json

RUN mkdir build

COPY ./requirements.txt ./build/requirements.txt

RUN pip3 install -r /build/requirements.txt                               
RUN apt remove -y python3-pip                                              
RUN apt autoremove --purge -y

COPY . ./build

RUN rm -rf /var/lib/apt/lists/* /etc/apt/sources.list.d/*.list

EXPOSE 80