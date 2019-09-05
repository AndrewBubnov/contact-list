const app = angular.module("contactList", [])
app.controller('contactListController', ($scope, $http) => {
    $scope.items = [];
    $scope.serverErrorMessage = '';
    $scope.serverError = false;
    const PORT = '/contacts/'

    $scope.getError = function (error) {
        if (angular.isDefined(error)) {
            if (error.required) {
                return "Empty field";
            }
        }
    }

    $http.get(PORT)
        .then(response => {
            $scope.items = response.data
        })
        .catch(err => console.log('Error: ', err));

    $scope.addItem = (newContact, isValid) => {
        if (isValid) {
            const contact = JSON.parse(JSON.stringify(newContact))
            contact.fullName = contact.firstName + ' ' + contact.lastName;
            $http.post(PORT + 'add', contact)
                .then(response => {
                    console.log(response)
                    $scope.items.push(response.data)
                    Object.keys(newContact).forEach(item => newContact[item] = '');
                    $scope.showError = false;
                })
                .catch(err => {
                    $scope.serverErrorMessage = err.data;
                    $scope.serverError = true;
                });
        } else {
            $scope.showError = true;
        }
    }

    $scope.deleteItem = (id) => {
        $http.delete(PORT + 'delete/' + id)
            .then(response => {
                const element = $scope.items.find(element => element.id === id);
                $scope.items.splice($scope.items.indexOf(element), 1)
            })
            .catch(err => console.log('Error: ', err))
    }

    $scope.editItem = (_id) => {
        $scope.items.find(element => element._id === _id).edited = true
    }

    $scope.saveItem = (item) => {
        const element = $scope.items.find(element => element._id === item._id);
        item.fullName = item.firstName + ' ' + item.lastName
        element.edited = false
        $http.put(PORT + 'edit', item)
            .then(response => {
                $scope.items.splice($scope.items.indexOf(element), 1, item)
            })
            .catch(err => console.log('Error: ', err))
    }

    $scope.hideServerErrorMessage = () => {
        $scope.serverError = false;
    }
})