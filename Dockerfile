FROM denoland/deno

EXPOSE 8000

WORKDIR /app

ADD . /app

# # Copy the necessary files
# COPY deno.json deno.lock ./

# # Copy the rest of your application code
# COPY . .

RUN deno install --entrypoint main.ts

CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read", "main.ts"]




