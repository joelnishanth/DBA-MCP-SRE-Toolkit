#!/bin/bash

# Test nginx configuration syntax
docker run --rm -v $(pwd)/nginx/nginx.conf:/etc/nginx/nginx.conf:ro nginx:latest nginx -t

# If the test passes, print success message
if [ $? -eq 0 ]; then
    echo "Nginx configuration test passed successfully!"
else
    echo "Nginx configuration test failed!"
    exit 1
fi