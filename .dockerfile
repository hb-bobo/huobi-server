FROM node
ADD .
EXPOSE 3000
RUN npm install
CMD []