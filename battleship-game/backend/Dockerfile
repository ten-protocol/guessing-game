FROM node:18

# working directory in the container
WORKDIR  /battleship-game

# Copy package.json and package-lock.json to the working directory
COPY battleship-game/backend/package*.json ./

# app dependencies
RUN npm install

# Bundle app source
COPY battleship-game/backend .

# Expose the port the app will run on
EXPOSE $BATTLESHIP_PORT

# Define environment variable
ENV BATTLESHIP_MONGO_URI $BATTLESHIP_MONGO_URI

# cmd to run the app
CMD ["npm", "start"]