# Use the official Rasa image (adjust the tag/version as needed)
FROM rasa/rasa:latest-full

# Set the working directory inside the container
WORKDIR /app

# Copy all project files into the container
COPY --chown=rasa:rasa . .

# Change ownership of all files in /app to the 'rasa' user
# RUN chown -R rasa:rasa /app

# Setting the port environment variable - currently commenting this out because I'm not sure how useful it will be
ENV PORT=5006

# Train the model 
RUN rasa train

# Expose the port Rasa will run on
EXPOSE 5006

# Resetting the entrypoint bcs the image automatically comes with a rasa entrypoint and it makes some things difficult
ENTRYPOINT []

# ENTRYPOINT [ "rasa" ]
# Run Rasa with API enabled and CORS open (adjust CORS value if needed)
CMD ["/bin/bash", "-c", "rasa run --enable-api --cors '*' --endpoints endpoints.yml --port ${PORT:-5006} --debug"]
