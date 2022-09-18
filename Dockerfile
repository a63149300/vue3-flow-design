FROM nginx:1.16

RUN echo "Asia/shanghai" > /etc/timezone;
RUN sed -i 's/\#gzip/gzip/g' /etc/nginx/nginx.conf;
ADD ./dist /usr/share/nginx/html
ADD ./docker/default.conf /etc/nginx/conf.d/
CMD ["nginx", "-g", "daemon off;"]

EXPOSE 80
