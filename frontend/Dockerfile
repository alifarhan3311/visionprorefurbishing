FROM node:22-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine
# Purani default config delete karein
RUN rm /etc/nginx/conf.d/default.conf
# Nayi config copy karein
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Build files copy karein
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
