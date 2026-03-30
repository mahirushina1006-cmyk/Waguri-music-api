FROM node:18

# install dependencies
RUN apt update && apt install -y ffmpeg python3 python3-pip

# install yt-dlp
RUN pip3 install yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
