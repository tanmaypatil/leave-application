/github/workspace/node_modules/hasura-cli/hasura version

cd leave-server-app/leave-system
#perform migrate
echo "performing migration"
hasura migrate apply --endpoint http://localhost:8080

