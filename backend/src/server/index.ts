const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync('recipe.proto');
const recipeProto = grpc.loadPackageDefinition(packageDefinition).recipe;

const recipes = [{ id: '1', title: 'Spaghetti', ingredients: ['Pasta', 'Tomato Sauce'], instructions: 'Cook pasta, add sauce' }];

function getRecipeById(call, callback) {
    const recipe = recipes.find(r => r.id === call.request.id);
    if (recipe) {
        callback(null, { recipe });
    } else {
        callback({
            code: grpc.status.NOT_FOUND,
            details: 'Recipe not found',
        });
    }
}

function main() {
    const server = new grpc.Server();
    server.addService(recipeProto.RecipeService.service, { getRecipeById });
    server.bind('127.0.0.1:50051', grpc.ServerCredentials.createInsecure());
    server.start();
    console.log('Server running on port 127.0.0.1:50051');
}

main();
