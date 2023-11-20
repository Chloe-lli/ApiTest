var uri = '../api/people';

$(document).ready(function () {
   
    $.getJSON(uri)
        .done(function (data) {
            console.log(data); 
            populateTable(data); 
        })
        .fail(function (jqXHR, textStatus, error) {
            console.log("Error fetching data: " + error);
        });
});

function formatItem(item) {
    return 'ID: ' + item.Id + ', Name: ' + item.Name + ', Age: ' + item.Age;
}


function searchByName() {
    var searchQuery = $('#personName').val();

    $.ajax({
        url: uri + '/search?name=' + encodeURIComponent(searchQuery),
        type: 'GET',
        success: function (data) {
            $('#peopleTable').find('tr:gt(0)').remove();

            if (data.length > 0) {
                
            } else {
                
                $('#peopleTable').append('<tr><td colspan="4">No results found</td></tr>'); 
            }
                populateTable(data);
        },
        error: function (xhr) {
            if (xhr.status === 404) {
                
                $('#peopleTable').find('tr:gt(0)').remove();
                $('#peopleTable').append('<tr><td colspan="4">No results found</td></tr>');
            } else {
                console.error('Error searching:', xhr.responseText);
            }
        }
    });
}




function addNewPerson() {
    var table = $('#peopleTable');
    var newRow = $('<tr>');
    newRow.append('<td>[ID will be assigned]</td>'); 
    newRow.append('<td><input type="text" placeholder="Name" /></td>');
    newRow.append('<td><input type="text" placeholder="Age" /></td>');
    newRow.append('<td><button onclick="saveNewPerson(this);">Save</button></td>');
    table.append(newRow);
    newRow[0].scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function saveNewPerson(buttonElement) {
    var row = $(buttonElement).closest('tr');
    var name = row.find('td input').eq(0).val();
    var age = row.find('td input').eq(1).val();

    var newPersonData = {
        Name: name,
        Age: parseInt(age, 10)
    };

    $.ajax({
        url: uri,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(newPersonData),
        success: function (result) {
            var editButton = '<button onclick="editPerson(this);">Edit</button>';
            var saveButton = '<button onclick="saveUpdatedPerson(this, ' + result.id + ');" style="display:none;">Save</button>';
            var deleteButton = '<button onclick="deletePerson(' + result.id + ')">Delete</button>';
            var actionCell = '<td>' + editButton + saveButton + ' ' + deleteButton + '</td>';

            row.html('<td>' + result.id + '</td><td>' + result.name + '</td><td>' + result.age + '</td>' + actionCell);
        },
        error: function (error) {
            console.log('Error adding new record:', error);
        }
    });
}


function deletePerson(personId) {
    $.ajax({
        url: uri + '/' + personId,
        type: 'DELETE',
        success: function (result) {         
            $('#peopleTable tr').filter(function () {
                return $(this).find('td:first').text() == personId;
            }).remove();
        },
        error: function (error) {
            console.log('Error deleting record:', error);
        }
    });
}

function editPerson(buttonElement) {
    var row = $(buttonElement).closest('tr');
    var nameCell = row.find('td').eq(1); 
    var ageCell = row.find('td').eq(2); 

    var currentName = nameCell.text();
    var currentAge = ageCell.text();

    nameCell.html('<input type="text" value="' + currentName + '" />');
    ageCell.html('<input type="number" value="' + currentAge + '" />');

    $(buttonElement).hide(); 
    row.find('td:last button').eq(1).show(); 
}




function saveUpdatedPerson(buttonElement, personId) {
    var row = $(buttonElement).closest('tr');
    var name = row.find('td input').eq(0).val(); 
    var age = row.find('td input').eq(1).val(); 

    var updatedPersonData = {
        Name: name,
        Age: parseInt(age, 10) 
    };

    $.ajax({
        url: uri + '/' + personId,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(updatedPersonData),
        success: function () {
            row.find('td').eq(1).html(name); 
            row.find('td').eq(2).html(age); 

            row.find('td:last button').eq(0).show(); 
            $(buttonElement).hide(); 
        },
        error: function (error) {
            console.log('Error updating record:', error);
        }
    });
}


function populateTable(data) {
    var table = $('#peopleTable');
    table.find('tr:gt(0)').remove(); 
    $.each(data, function (key, item) {
        var deleteButton = '<button onclick="deletePerson(' + item.id + ')">Delete</button>';
        var editButton = '<button onclick="editPerson(this);">Edit</button>';
        var saveButton = '<button onclick="saveUpdatedPerson(this, ' + item.id + ');" style="display:none;">Save</button>';

        var actionCell = '<td>' +editButton + saveButton + ' '  + deleteButton + '</td>';
         
        var row = '<tr><td>' + item.id + '</td><td>' + item.name + '</td><td>' + item.age + '</td>' +  actionCell+ '</tr>';
        table.append(row);
    });
}






