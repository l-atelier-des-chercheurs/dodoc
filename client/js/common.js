jQuery.fn.reverse = [].reverse;

function transformDatetoString( date){
  if( date == undefined)
    return false;

  var getMomentObject = moment( date, 'YYYYMMDD_HH:mm:ss');
  var formatDate = getMomentObject.format('Do MMMM YYYY');
	return formatDate;
}

function transformDatetoTimestamp(date) {
  if( date == undefined)
    return false;
  var getMomentObject = moment( date, 'YYYYMMDD_HH:mm:ss');
  var formatDate = getMomentObject.format('X');
	return formatDate;
}

function anyDuplicates(a) {
    var counts = [];
    for(var i = 0; i <= a.length; i++) {
        if(counts[a[i]] === undefined) {
            counts[a[i]] = 1;
        } else {
            return true;
        }
    }
    return false;
}
