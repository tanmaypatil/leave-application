/github/workspace/node_modules/hasura-cli/hasura version

cd leave-server-app/leave-system
#print hasura host 
echo ${HASURA_HOST}
#perform migrate
echo "performing migration"
hasura migrate apply --endpoint http://${HASURA_HOST}:8080

