define([], function () {
    function mainFaceController($scope) {
        $scope.$on('someEvent', function (event, data) {
            console.log(data);
        });

        window.gfScope = $scope;
    }
    return mainFaceController;
});