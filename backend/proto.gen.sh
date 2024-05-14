#!/bin/bash

# bebas sesuaiin aja mau ditaruh di mana
npx proto-loader-gen-types --grpcLib=@grpc/grpc-js --outDir=./src/proto/ ../proto/*.proto 
#!/bin/bash
grpc_tools_node_protoc --ts_out=src/generated --js_out=import_style=commonjs,binary:src/generated --grpc_out=grpc_js:src/generated -I . recipe.proto

