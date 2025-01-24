using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using AccouontManager.AccountManagerAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class AccountsController : ControllerBase
{
  private readonly string _filePath = Path.Combine(Directory.GetCurrentDirectory(), "data.json");
  private readonly ILogger<AccountsController> _logger;

  public AccountsController(ILogger<AccountsController> logger)
  {
    _logger = logger;
  }

  [HttpGet]
  public ActionResult<IEnumerable<Account>> Get()
  {
    _logger.LogInformation("Fetching all accounts");
    var accounts = ReadData();
    return Ok(accounts);
  }

  [HttpPost]
  public ActionResult<Account> Post([FromBody] Account account)
  {
    _logger.LogInformation($"Adding new account: {account.Platform} - {account.Email}");
    var accounts = ReadData();
    account.Id = accounts.Any() ? accounts.Max(a => a.Id) + 1 : 1; // Generate a new Id
    accounts.Add(account);
    WriteData(accounts);
    return CreatedAtAction(nameof(Post), new { id = account.Id }, account);
  }

  [HttpPut("{id}")]
  public IActionResult Put(int id, [FromBody] Account account)
  {
    _logger.LogInformation($"Updating account: {id}");
    var accounts = ReadData();
    var index = accounts.FindIndex(a => a.Id == id);
    if (index == -1)
    {
      _logger.LogWarning($"Account not found: {id}");
      return NotFound();
    }
    accounts[index] = account;
    WriteData(accounts);
    return NoContent();
  }

  [HttpDelete("{id}")]
  public IActionResult Delete(int id)
  {
    _logger.LogInformation($"Deleting account: {id}");
    var accounts = ReadData();
    var account = accounts.FirstOrDefault(a => a.Id == id);
    if (account == null)
    {
      _logger.LogWarning($"Account not found: {id}");
      return NotFound();
    }
    accounts.Remove(account);
    WriteData(accounts);
    return NoContent();
  }

  private List<Account> ReadData()
  {
    if (!System.IO.File.Exists(_filePath))
    {
      return new List<Account>();
    }
    var json = System.IO.File.ReadAllText(_filePath);
    return JsonSerializer.Deserialize<List<Account>>(json);
  }

  private void WriteData(List<Account> accounts)
  {
    var json = JsonSerializer.Serialize(accounts, new JsonSerializerOptions { WriteIndented = true });
    System.IO.File.WriteAllText(_filePath, json);
  }
}