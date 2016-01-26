'use strict';

var module = angular.module( 'galleryCtrl', [ 'dataService' ] );

module.controller( 'galleryController', [ '$scope', 'modelData', '$routeParams', 'pictRetriever', 'pictSort', 'configObject',  GalleryConstructor ] );

function GalleryConstructor( $scope, modelData, $routeParams, pictRetriever, pictSort, configObject ){
    
    $scope.name = 'galleryCtrl';
    $scope.searchText = '';
    $scope.id = $routeParams.id;
    $scope.showModal = false;
    $scope.pictureToShow = '';
    $scope.titleOfPicture = '';
    
    // Used to show/hide spinner while data are retrieve
    $scope.processing = true;
    // All pictures of one gallery
    $scope.pictures = modelData.getGalleryId( $scope.id );

    // Pagination 
    // If we have changed of gallery reset the currentPageGallery to 1
    if( configObject.getGalleryId() !== $scope.id ) {
        configObject.setCurrentPageGallery( 1 );
    }
    configObject.setGalleryId( $scope.id );
    $scope.currentPage = configObject.getCurrentPageGallery();
    $scope.numPerPage = 10;
    $scope.maxSize = 5;
    var filterData = function(){
        var begin = (($scope.currentPage - 1) * $scope.numPerPage)
        , end = begin + $scope.numPerPage;

        configObject.setCurrentPageGallery( $scope.currentPage );
        $scope.filteredPicturesData = $scope.pictures.slice(begin, end);
    };
    
    // retrieve data, update view and create pagination
    if( $scope.pictures === undefined ){
        var promise = pictRetriever.retrievePictures();
        promise.then( function( data ){
            return data;
        }).then( function( data ){
            var promise2 = pictSort.sortData( data );
            
            promise2.then( function( data ){
                modelData.setData( data );
                $scope.pictures = modelData.getGalleryId( $scope.id );
                
                // Pagination 
                $scope.$watch('currentPage + numPerPage', function() {
                    filterData();
                });
                
                $scope.processing = false;
            });
        });
    } else {
        // Pagination 
        $scope.$watch('currentPage + numPerPage', function() {
            filterData();
        });
        // If Data already retrieve then remove immediatly the spinner
        $scope.processing = false;
    }
    
    $scope.clickOnThumbnailPicture = function( title, url ){
        //Update picture to show
        $scope.pictureToShow = url;
        $scope.titleOfPicture = title;

        $scope.toggleModal();
    };
    
    $scope.toggleModal = function(){
        $scope.showModal = !$scope.showModal;
    };
};

// Directive use to show picture when you click on a thumbnail
module.directive('modal', function () {
    return {
        template: '<div class="modal fade">' + 
          '<div class="modal-dialog">' + 
            '<div class="modal-content">' + 
              '<div class="modal-header">' + 
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' + 
                '<h4 class="modal-title">{{ title }}</h4>' + 
                '<img src="{{ url }}"  style="width: 570px;"/> '+ 
              '</div>' + 
              '<div class="modal-body" ng-transclude></div>' + 
            '</div>' + 
          '</div>' + 
        '</div>',
        restrict: 'E',
        transclude: true,
        replace:true,
        scope:true,
        link: function postLink(scope, element, attrs) {
        scope.title = '';
        scope.url = '';

        scope.$watch(attrs.visible, function(value){
            scope.title = attrs.title;
            scope.url = attrs.url;

            if(value == true){
                $(element).modal('show');
            }
            else{
                $(element).modal('hide');
            }
        });

        $(element).on('shown.bs.modal', function(){
            scope.$apply(function(){
                scope.$parent[attrs.visible] = true;
            });
        });

        $(element).on('hidden.bs.modal', function(){
            scope.$apply(function(){
                scope.$parent[attrs.visible] = false;
            });
        });
      }
    };
  });