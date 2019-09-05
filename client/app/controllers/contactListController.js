const app = angular.module("contactList", [])
app.controller('contactListController', ($scope, $http) => {
    $scope.items = [];
    $scope.serverErrorMessage = '';
    $scope.serverError = false;
    $scope.oldItem = {};
    const PORT = '/contacts/';

    $scope.getError = function (error) {
        if (angular.isDefined(error)) {
            if (error.required) {
                return "Empty field";
            }
        }
    }

    $scope.showServerErrorMessage = (text) => {
        $scope.serverErrorMessage = text;
        $scope.serverError = true;
    }

    $scope.hideServerErrorMessage = () => {
        $scope.serverError = false;
    }

    $http.get(PORT)
        .then(response => {
            $scope.items = response.data
        })
        .catch(err => $scope.showServerErrorMessage(err.data));

    $scope.addItem = (newContact, isValid) => {
        if (isValid) {
            const contact = JSON.parse(JSON.stringify(newContact))
            contact.fullName = contact.firstName + ' ' + contact.lastName;
            contact.edited = false;
            $http.post(PORT + 'add', contact)
                .then(response => {
                    $scope.items.push(response.data)
                    Object.keys(newContact).forEach(item => newContact[item] = '');
                    $scope.showError = false;
                })
                .catch(err => {
                    $scope.showServerErrorMessage(err.data)
                });
        } else {
            $scope.showError = true;
        }
    }

    $scope.deleteItem = (_id) => {
        $http.delete(PORT + 'delete/' + _id)
            .then(response => {
                const element = $scope.items.find(element => element._id === _id);
                $scope.items.splice($scope.items.indexOf(element), 1);
            })
            .catch(err => $scope.showServerErrorMessage(err.data));
    }

    $scope.editItem = (_id) => {
        const item = $scope.items.find(element => element._id === _id);
        angular.copy(item, $scope.oldItem);
        item.edited = true;
    }

    $scope.saveItem = (item) => {
        const element = $scope.items.find(element => element._id === item._id);
        item.fullName = item.firstName + ' ' + item.lastName;
        element.edited = false;
        $http.put(PORT + 'edit', item)
            .then(response => {
                $scope.items.splice($scope.items.indexOf(element), 1, response.data);
            })
            .catch(err => {
                $scope.showServerErrorMessage(err.data);
                $scope.items.splice($scope.items.indexOf(element), 1, $scope.oldItem);
                $scope.oldItem = {};
            })
    }
})