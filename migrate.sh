hasura update-cli --version v1.3.4-beta.3

hasura version

cd leave-server-app/leave-system
#print hasura host 
echo ${HASURA_HOST}
#perform migrate
echo "performing migration"
hasura migrate apply --endpoint http://${HASURA_HOST}:8080
echo "perform hasura seeds application"
hasura seed apply --endpoint http://${HASURA_HOST}:8080
echo "performing metadata application"
hasura metadata apply --endpoint http://${HASURA_HOST}:8080

echo "moving to root folder"
cd ../..
echo "current working dir ${PWD}"

