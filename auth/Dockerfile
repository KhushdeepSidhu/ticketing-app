# Use an existing docker image as a base 
FROM node:14-alpine

# Specify the workingdirectory for the project
WORKDIR /app

# Download and install a dependency 

# Run the "npm install" only when there is a change in the package.json file
COPY ./package.json ./
RUN npm install --omit=dev

# Copy the required directories to the container
COPY ./ ./

# Tell the image what to do when it starts as a container
CMD ["npm", "start"]