'use strict';

var module = angular.module( 'homeCtrl', [ 'dataService' ] );

module.controller( 'homeController', [ '$scope', 'pictRetriever', 'pictSort', 'modelData', 'configObject', HomeConstructor ] );

function HomeConstructor( $scope, pictRetriever, pictSort, modelData, configObject ){

    $scope.name = 'homeCtrl';
    $scope.searchText = '';
    $scope.picturesData = [];
    $scope.filteredPicturesData = [];
    
    // Spinner 
    $scope.processing = true;
    
    // Pagination 
    $scope.currentPage = configObject.getCurrentPageHome();
    $scope.numPerPage = 10;
    $scope.maxSize = 5;
    var filterData = function(){
        var begin = (($scope.currentPage - 1) * $scope.numPerPage)
        , end = begin + $scope.numPerPage;

        configObject.setCurrentPageHome( $scope.currentPage );
        $scope.filteredPicturesData = $scope.picturesData.slice(begin, end);
    };
    
    // retrieve data, update view and create pagination
    if( modelData.getData() !== undefined ){
        $scope.picturesData = modelData.getData();

        $scope.$watch('currentPage + numPerPage', function() {
            filterData();
        });

        $scope.processing = false;
    } else {
        var promise = pictRetriever.retrievePictures();
        promise.then( function( data ){
            return data;
        }).then( function( data ){
            var promise2 = pictSort.sortData( data );
            
            promise2.then( function( data ){
                $scope.picturesData = data;
                modelData.setData( data );
                $scope.processing = false;
                
                // Pagination 
                $scope.$watch('currentPage + numPerPage', function() {
                    filterData();
                });
            });
        });
    }
};