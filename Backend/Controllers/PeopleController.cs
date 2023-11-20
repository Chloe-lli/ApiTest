using ApiTest.Backend.Model;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;


namespace ApiTest.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PeopleController : ControllerBase
    {
        private readonly List<Person> _people;
        string filePath = "../../data.json";
        string json = System.IO.File.ReadAllText(@"data.json");
        RootObject rootObject;

        public PeopleController()
        {

            rootObject = JsonConvert.DeserializeObject<RootObject>(json);
            _people = rootObject.People;
        }

        [HttpGet]
        public IEnumerable<Person> GetAllPeople()
        {
            return _people;
        }

        [HttpGet("{id}")]
        public ActionResult<Person> GetPersonByID(int id)
        {
            var person = _people.FirstOrDefault(p => p.Id == id);
            if (person == null)
            {
                return NotFound();
            }
            return Ok(person);
        }

        [HttpGet("search")]
        public ActionResult<IEnumerable<Person>> SearchByName(string name)
        {
            var matchingPeople = _people
                .Where(p => p.Name.IndexOf(name, StringComparison.OrdinalIgnoreCase) >= 0)
                .ToList();

            if (!matchingPeople.Any())
            {
                return NotFound();
            }

            return matchingPeople;
        }


        [HttpPost]
        public ActionResult<Person> AddPerson(Person person)
        {

            if (person == null)
            {
                return BadRequest("Person data is null");
            }
            var newId = _people.Any() ? _people.Max(p => p.Id) + 1 : 1;
            person.Id = newId;
            _people.Add(person);


            try
            {
                SaveToFile();
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while writing to the file");
            }

            return CreatedAtAction(nameof(GetPersonByID), new { id = person.Id }, person);
        }

        [HttpPut("{id}")]
        public ActionResult UpdatePerson(int id, Person person)
        {
            var existingPerson = _people.FirstOrDefault(p => p.Id == id);
            if (existingPerson == null)
            {
                return NotFound();
            }

            existingPerson.Name = person.Name;
            existingPerson.Age = person.Age;

            try
            {
                SaveToFile();
                return NoContent();
            }
            catch (Exception ex)
            {
                
                return StatusCode(500, "An error occurred while writing to the file.");
            }
        }

        [HttpDelete("{id}")]
        public ActionResult DeletePerson(int id)
        {
            var person = _people.FirstOrDefault(p => p.Id == id);
            if (person == null)
            {
                return NotFound();
            }

            _people.Remove(person);

            try
            {
                SaveToFile(); 
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while writing to the file.");
            }

            return NoContent(); 
        }

        private void SaveToFile()
        {
            var rootObject = new RootObject { People = _people };
            var json = JsonConvert.SerializeObject(rootObject);
            try
            {
                System.IO.File.WriteAllText(filePath, json);
            }
            catch (Exception ex)
            {
                
                throw; 
            }
        }

    }
}
