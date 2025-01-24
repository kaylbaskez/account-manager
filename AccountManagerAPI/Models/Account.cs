using System;

namespace AccouontManager.AccountManagerAPI.Models
{
    public class Account
    {
        public int Id { get; set; }
        public required string Platform { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}
