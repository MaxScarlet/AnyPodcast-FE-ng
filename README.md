aws s3 sync ./dist_dev s3://st.eu.oxymoron-technique.com --region eu-west-1

aws s3 sync ./dist_dev s3://web.il.oxymoron-technique.com --region il-central-1
aws s3 cp ./dist_dev s3://web.il.oxymoron-technique.com --region il-central-1 --recursive --exclude "*" --include "*.js" --content-type "application/javascript"
