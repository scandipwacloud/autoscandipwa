# Welcome to automatization manual

### System supported:
* Arch
* Ubuntu (18.4, 19.10, 20.04)
* Manjaro (20.0.3)
* Linux Mint (19.10)
* MacOS Catalina

All others OS should be tested!

### Need to have to use the script:
* COMPOSER_AUTH

### Information
* If you have COMPOSER_AUTH as environment variable - you won't be asked for it
* If you have aliases preinstalled / same aliases used - you won't be asked if you want to add them
* If you have nodejs preinstalled, please make sure you are using <b>^=10.2</b>

### Linux Start

1. Run the script
   ```
   bash install.sh
   ```

### MacOS Start

1. Install docker, run it and give special permissions manually
   [Download here](https://hub.docker.com/editions/community/docker-ce-desktop-mac/)

2. Run the script
   ```
   bash install.sh
   ```


### FAQ

#### SSL certificates
If scandipwa.local website is not trusted by default, then please:
1. Import the scandipwa-base/opt/cert/scandipwa-fullchain.pem
2. Type thisisunsafe on the certificate error page

#### Please set COMPOSER_AUTH environment variable
- Stop docker containers and restart the script

#### 502 bad gateway
Chrome and other browsers can cache page, just use hard reload or incognito mode. If doesn't help restart some containers
- With aliases
```
dc restart nginx ssl-term
dc restart varnish
```
- Without aliases
```
docker-compose -f docker-compose.yml -f docker-compose.local.yml -f docker-compose.ssl.yml restart nginx ssl-term
docker-compose -f docker-compose.yml -f docker-compose.local.yml -f docker-compose.ssl.yml restart varnish
```

#### Port {port} is used problem
If you don't know what can use specific port, you can print it:
```
sudo lsof -i -P -n | grep -w "*:{port} (LISTEN)" 
```

#### Set up from beginning (install demo again)
Delete .env file in root of <b>autoscandipwa</b> folder
- ``` rm -rf .env ```

#### Elasticsearch dead
```
dcf down
docker volume rm scandipwa-base_elasticsearch-data
dcf pull
dcf up -d
```

#### SSL container is dead
- Check if scandipwa-base/opt/cert/ is not empty
- Remove .env from autoscandipwa folder
- Rerun the script and watch for SSL generation errors

### Other important information
#### Stop demo

With aliases
``` 
cd scandipwa-base && dcf down 
```

Without aliases

``` 
cd scandipwa-base && docker-compose -f docker-compose.yml -f docker-compose.local.yml -f docker-compose.ssl.yml -f docker-compose.frontend.yml down 
```

#### Delete some of demo docker images (others should be deleted manually)
```
docker rmi scandipwa/base scandipwa/rendertron scandipwa/varnish 
```

#### Delete all the demo docker images (including ALL other docker images)
``` 
docker system prune -a 
```

#### Aliases added by script
- Use `dc` to start without `frontend` container
```
alias dc="docker-compose -f docker-compose.yml -f docker-compose.local.yml -f docker-compose.ssl.yml"
```

- Use `dcf` to start with `frontend` container
```
alias dcf="docker-compose -f docker-compose.yml -f docker-compose.local.yml -f docker-compose.ssl.yml -f docker-compose.frontend.yml"
```

- Use `inapp` to quickly get inside of the app container
```
alias inapp="docker-compose -f docker-compose.yml -f docker-compose.local.yml -f docker-compose.ssl.yml -f docker-compose.frontend.yml exec -u user app"
```

- Use `infront` to quickly get inside of the frontend container
```
alias infront="docker-compose -f docker-compose.yml -f docker-compose.local.yml -f docker-compose.ssl.yml -f docker-compose.frontend.yml exec -w /var/www/public/app/design/frontend/Scandiweb/pwa/ frontend"
```

- Use `applogs` to quickly see the last 100 lines of app container logs
```
alias applogs="docker-compose logs -f --tail=100 app"
```

- Use `frontlogs` to quickly see the last 100 lines of frontend container logs
```
alias frontlogs="docker-compose -f docker-compose.yml -f docker-compose.local.yml -f docker-compose.ssl.yml -f docker-compose.frontend.yml logs -f --tail=100 frontend"
```

### Additional info can be also found online
   [Online Documentation](https://docs.scandipwa.com/)