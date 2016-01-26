var module = angular.module( 'dataService', [] );

// This service is the entry point to retrieve Data and then sort it
module.service( 'pictRetriever', [ '$http', '$q', 'pictSort', 'modelData', function( $http, $q, pictSort, modelData ){
    this.dataSorted = {};
    this.retrievePictures = function(){
        var deferred = $q.defer();
        if( modelData.getData() !== undefined ){
            deferred.resolve( this.dataSorted );
        }
        $http({
            method: 'GET',
            url: 'http://jsonplaceholder.typicode.com/photos'
        }).then(function successCallback(response) {
            deferred.resolve( response );
        }, function errorCallback(response) {
            deferred.reject( response );
        });
        
        return deferred.promise;
    };
    this.setData = function( data ){
        this.dataSorted = data;
    }.bind( this );
} ] );

// This service is used to sort the raw data retrieve from http://jsonplaceholder.typicode.com/photos.
module.service( 'pictSort',[ '$q', function( $q ){
    var sortedData = [];
    var idTmp = 0;
    // Function which allow to sort data
    this.sortData = function( data ){
        var deferred = $q.defer();
        for (var id in data.data) {
            if( data.data[id].albumId !== idTmp ){
                sortedData[data.data[id].albumId] = [] ;
                idTmp = data.data[id].albumId;
            }
            sortedData[idTmp].push( data.data[id] );
            if( Number(id)+1 === data.data.length ){
                deferred.resolve( sortedData );
            }
        }
        return deferred.promise;
    };
} ] );

// Allow to stock data once we sorted it and return it whenever some controller need it
module.factory( 'modelData', function(){
    var dataSorted;
    return {
        setData : function( data ){
            dataSorted = data;
        },
        getData : function(){
            return dataSorted;
        },
        getGalleryId : function( id ){
            return ( dataSorted === undefined ) ? undefined : dataSorted[id];
        }
    }
} );

// Is there to keep some important information about Pagination 
module.factory( 'configObject', function(){
    var currentPageHome;
    var currentPageGallery;
    var currentIdGallery;
    return {
        setCurrentPageHome : function( data ){
            currentPageHome = data;
        },
        getCurrentPageHome : function(){
            return ( currentPageHome === undefined ) ? 1 : currentPageHome;
        },
        setCurrentPageGallery : function( data ){
            currentPageGallery = data;
        },
        getCurrentPageGallery : function(){
            return ( currentPageGallery === undefined ) ? 1 : currentPageGallery;
        },
        getGalleryId : function(){
            return currentIdGallery;
        },
        setGalleryId : function( id ){
            currentIdGallery = id;
        },
    }
} );