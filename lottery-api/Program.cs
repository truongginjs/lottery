using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

var origins = "AllowAllOrigins";
// Add services to the container.

builder.Services.AddCors(options => options.AddPolicy(origins, builder =>
                 builder.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()|| true)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(origins);



app.MapGet("/id/{id}", (string id = "0") =>
{
    Rate.ID = id;
    return Rate.ID;
});
app.MapGet("/id", () =>
{
    return Rate.ID;
});


app.MapGet("/department/set", ([FromQuery] string department = "Bộ phận IT") =>
{
    Rate.DEPARTMENT = department;
    return Rate.DEPARTMENT;
});

app.MapGet("/department", () =>
{
    return Rate.DEPARTMENT;
});

app.MapGet("/rate/{rate}", (int rate) =>
{
    Rate.RATE = rate;
    return Rate.RATE;
});


app.MapGet("/rate", () =>
{
    return Rate.RATE;
});

app.Run();

