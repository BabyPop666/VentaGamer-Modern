FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY VentaGamer.sln global.json ./
COPY src/VentaGamer.Domain/*.csproj src/VentaGamer.Domain/
COPY src/VentaGamer.Application/*.csproj src/VentaGamer.Application/
COPY src/VentaGamer.Infrastructure/*.csproj src/VentaGamer.Infrastructure/
COPY src/VentaGamer.Api/*.csproj src/VentaGamer.Api/

RUN dotnet restore VentaGamer.sln

COPY src/ src/
RUN dotnet publish src/VentaGamer.Api/VentaGamer.Api.csproj -c Release -o /app /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "VentaGamer.Api.dll"]
