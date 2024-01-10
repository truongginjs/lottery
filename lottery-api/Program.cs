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
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(origins);
app.MapGet("/{rate}", (int rate) =>
{
    Rate.RATE = rate;
    return Rate.RATE;
});


app.MapGet("/", () =>
{
    return Rate.RATE;
});

app.Run();

