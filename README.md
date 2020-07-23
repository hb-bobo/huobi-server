### ts-server

## run setup

``` bash
# use npm
npm install

# run
npm run dev

# build
npm run tsc

# use pm2

npm run pm2:prod

```

server {
    listen       8081 default_server;
    listen       [::]:8081 default_server;
    server_name  _;
    root         /usr/local/src/plothis-official-website/build/client-admin/;

    # Load configuration files for the default server block.
    include /etc/nginx/default.d/*.conf;

    location / {
    }

    error_page 404 /404.html;
        location = /40x.html {
    }

    error_page 500 502 503 504 /50x.html;
        location = /50x.html {
    }

}