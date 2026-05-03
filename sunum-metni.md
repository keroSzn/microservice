# Mikroservislerde Deklaratif Web Servis İstemcileri (Declarative Web Service Clients)
## Detaylı Sunum Notları ve Proje Anlatımı

Bu doküman, projeyi baştan sona eksiksiz bir şekilde (kod detayları dahil) anlatmanız için hazırlanmış Türkçe sunum rehberidir.

---

### Slayt 1: Kapak ve Giriş
**Başlık:** Mikroservis Mimarisinde Deklaratif İstemciler: OpenFeign, WebClient ve Netflix Feign Karşılaştırması
**Konuşmacı Notu:** Merhabalar. Bugün sizlere mikroservis mimarilerinin en önemli sorunlarından biri olan "servisler arası iletişim" konusunu ve bu iletişimi en temiz şekilde çözmemizi sağlayan "Declarative Web Service Client" (Deklaratif Web Servis İstemcileri) teknolojilerini uygulamalı bir proje üzerinden anlatacağız.

---

### Slayt 2: Problem Nedir? Neden Bu Teknolojilere İhtiyacımız Var?
**İçerik:**
- Geleneksel Yöntemler: `RestTemplate`, `HttpURLConnection`, `HttpClient`.
- Sorunlar: Aşırı kod tekrarı (Boilerplate), karmaşık hata yönetimi, URL ve Header'ların manuel yönetilmesi.

**Konuşmacı Notu:** Eskiden bir mikroservisten diğerine veri çekerken `RestTemplate` kullanıyorduk. Ancak bu yaklaşım, URL'leri string olarak birleştirmek, header'ları manuel setlemek ve gelen JSON yanıtını objeye çevirmek için sayfalarca kod (boilerplate) yazmamızı gerektiriyordu. Mikroservis sayısı arttıkça bu durum projeyi "spagetti koda" çevirip bakımı imkansız hale getiriyordu. Bize daha temiz ve standart bir çözüm lazımdı.

---

### Slayt 3: Çözüm: Declarative (Açıklamalı/Deklaratif) İstemciler
**İçerik:**
- "Ne yapılacağını söyle, nasıl yapılacağını framework halletsin."
- Sadece bir Java `Interface` (Arayüz) tanımlanır.
- Spring veya Feign Anotasyonları ile süslenir.
- Geri kalan tüm HTTP bağlantı altyapısı çalışma zamanında (runtime) otomatik üretilir.

**Konuşmacı Notu:** Çözüm deklaratif yaklaşımdır. Biz kod geliştiriciler olarak sadece "Benim şöyle bir interface'im var, şu URL'ye GET isteği atacak, şu veriyi döndürecek" diye tanımlarız. Uygulama ayağa kalktığında framework bizim için arkaplanda o requesti atacak kodu otomatik yazar. Bu, SOLID prensiplerine çok daha uygundur ve kodun okunabilirliğini muazzam artırır.

---

### Slayt 4: Projemizin Mimarisi
**İçerik:**
Docker üzerinde çalışan 4 ana bileşen:
1. **PostgreSQL Database:** Sistemimizin kalıcı veri deposu.
2. **User Service (Port 8081):** Spring Data JPA ile veritabanına bağlanan, Müşteri verilerini yöneten servis.
3. **Inventory Service (Port 8082):** Ürün ve stok bilgilerini JPA üzerinden veritabanında tutan servis.
4. **Order Aggregator (Port 8080):** "Client Hub". Tüm bu servislerden veri toplayıp sipariş (Order) oluşturan ve modern bir Admin Dashboard barındıran orkestrasyon servisi.

**Konuşmacı Notu:** Projemizi tamamen gerçeğe uygun modelledik. Docker Compose ile ayağa kalkan bir PostgreSQL veritabanımız ve Spring Boot ile yazılmış bağımsız 3 servisimiz var. Asıl odaklanacağımız yer "Order Aggregator" servisi olacak. Çünkü bu servis, diğer servislere bağlanmak için sunumumuzun da konusu olan 3 farklı istemci teknolojisini aynı anda kullanıyor.

---

### Slayt 5: Teknoloji 1 - Spring Cloud OpenFeign
**İçerik:** Kullanıcı (User) Servisine Bağlanırken.
- **Karakteristiği:** Netflix tarafından geliştirilen, Spring Cloud'un standart kabul ettiği senkron yapılı istemci.

**Nasıl İmplemente Edildi? (Kod Detayı):**
Öncelikle ana sınıfımıza `@EnableFeignClients` ekledik. Sonrasında `UserClient` interface'ini şu şekilde yazdık:

```java
@FeignClient(name = "user-service", url = "${user-service.url}")
public interface UserClient {

    @GetMapping("/users/{id}")
    UserDTO getUser(@PathVariable("id") Long id);

    @PostMapping("/users")
    UserDTO createUser(@RequestBody UserDTO user);
}
```

**Konuşmacı Notu:** Kodda da görebileceğiniz üzere implementasyon sıfır! Sadece sınıfın başına `@FeignClient` koyduk ve hedef servisin URL'ini verdik. İçerisinde ise bildiğimiz klasik Spring MVC anotasyonlarını (`@GetMapping`, `@PostMapping`) kullandık. Spring arkaplanda bu interface'i okuyup `user-service`'e istek atacak HTTP kodlarını anında üretti. OpenFeign'in gücü ve endüstri standardı olmasının sebebi budur: Aşırı basittir.

---

### Slayt 6: Teknoloji 2 - WebClient ve Spring 6 HTTP Interfaces
**İçerik:** Envanter (Inventory) Servisine Bağlanırken.
- **Karakteristiği:** Spring 6 ile gelen, tamamen Reaktif (Non-blocking) programlamaya uygun modern yapı.

**Nasıl İmplemente Edildi? (Kod Detayı):**
`InventoryClient` interface'ini Spring 6'nın yeni anotasyonlarıyla tanımladık:

```java
public interface InventoryClient {

    @GetExchange("/products/{id}")
    ProductDTO getProduct(@PathVariable("id") Long id);

    @PostExchange("/products")
    ProductDTO createProduct(@RequestBody ProductDTO product);
}
```
OpenFeign'den farklı olarak bunu Spring'e tanıtmak için küçük bir Proxy Factory bean'i oluşturmamız gerekti:
```java
@Bean
public InventoryClient inventoryClient() {
    WebClient webClient = WebClient.builder().baseUrl(inventoryUrl).build();
    HttpServiceProxyFactory factory = HttpServiceProxyFactory
            .builderFor(WebClientAdapter.create(webClient)).build();
    return factory.createClient(InventoryClient.class);
}
```

**Konuşmacı Notu:** Burada Spring Cloud bağımlılığından tamamen kurtulup Spring'in kendi çekirdek WebClient altyapısını kullanıyoruz. Dikkat ederseniz anotasyonlar `@GetExchange` ve `@PostExchange` olarak değişti. Gelecekte yüksek performanslı ve asenkron (reaktif) mikroservisler geliştirirken bu HTTP Interface'ler OpenFeign'in tahtını sallayacak en güçlü alternatiftir.

---

### Slayt 7: Teknoloji 3 - Saf (Pure) Netflix Feign Core
**İçerik:** Dış Dünyaya (External API) Bağlanırken.
- **Karakteristiği:** Spring ekosistemine bağımlı olmayan, Builder deseniyle programatik konfigüre edilen orijinal kütüphane.

**Nasıl İmplemente Edildi? (Kod Detayı):**
`PostClient` interface'ini saf Feign anotasyonlarıyla yazdık:

```java
public interface PostClient {
    @RequestLine("GET /posts/{id}")
    PostDTO getPostById(@Param("id") Long id);
}
```
Bunu kullanabilmek için Spring'in IoC container'ını beklemeden manuel olarak build ettik:
```java
PostClient postClient = Feign.builder()
    .encoder(new JacksonEncoder())
    .decoder(new JacksonDecoder())
    .target(PostClient.class, "https://jsonplaceholder.typicode.com");
```

**Konuşmacı Notu:** Son olarak işin mutfağına inmek istedik. Eğer Spring kullanmasaydık (örneğin düz bir Java konsol uygulamasında) bu işi nasıl yapardık? Saf Netflix Feign imdadımıza yetişiyor. Kendi `@RequestLine` anotasyonunu kullanıyor ve `Feign.builder()` üzerinden JSON dönüşümleri yapacak decoder'ları kendimiz manuel veriyoruz. Bu yapı bize OpenFeign'in aslında arkada ne kadar çok işi bizden gizleyip otomatik yaptığını çok iyi gösteriyor.

---

### Slayt 8: Veritabanı ve Sipariş Oluşturma Mantığı
**İçerik:** Order Controller Nasıl Çalışıyor?
Tüm bu istemcileri `OrderController` sınıfında tek bir metodda birleştirdik.

**Kod Detayı:**
```java
@GetMapping("/orders/create/{userId}/{productId}")
public OrderResponse createOrder(@PathVariable Long userId, @PathVariable Long productId) {
    // 1. OpenFeign ile User çekilir
    UserDTO user = userClient.getUser(userId);
    
    // 2. WebClient HTTP Interface ile Product çekilir
    ProductDTO product = inventoryClient.getProduct(productId);
    
    // 3. PostgreSQL Veritabanına Kayıt
    OrderEntity order = new OrderEntity();
    order.setUserId(userId);
    order.setProductId(productId);
    orderRepository.save(order);

    return new OrderResponse(user, product, order);
}
```

**Konuşmacı Notu:** Müşteri bir sipariş oluşturduğunda; kodumuz sırasıyla **OpenFeign** üzerinden User servisine gidip müşterinin bakiyesini kontrol ediyor, **WebClient** üzerinden Inventory servisine gidip stok durumuna bakıyor. İkisi de başarılıysa PostgreSQL veritabanımızdaki `orders` tablosuna bu siparişi kalıcı olarak kaydediyor. İşte tam bu an, farklı servislerin kusursuz orkestrasyonunu sağladığımız andır.

---

### Slayt 9: Canlı Demo (Admin Dashboard)
**Konuşmacı Notu:** Şimdi sizlere geliştirdiğimiz modern **Admin Dashboard** arayüzü üzerinden projemizi canlı olarak göstereceğiz. 
*(Bu esnada tarayıcıdan http://localhost:8080/admin.html açılır)*
Arayüzden yeni bir kullanıcı ve ürün ekleyeceğiz. Bu istekler sırasıyla OpenFeign ve WebClient üzerinden mikroservislerimize iletilip PostgreSQL'e yazılacak. Ardından Orders sekmesinden bu eklediğimiz verileri seçerek sipariş butonuna basacağız ve sistemin nasıl eşzamanlı çalışıp siparişi veritabanına kaydettiğini canlı olarak deneyimleyeceğiz.

---

### Slayt 10: Sonuç ve Kapanış
- **OpenFeign:** Standart Spring MVC projeleri için, kullanımı en rahat ve kendini kanıtlamış çözümdür.
- **WebClient (HTTP Interfaces):** Modern, asenkron ve reaktif mimariler için Spring'in geleceğe yatırımıdır.
- **Netflix Feign:** Framework bağımsız projeler ve "bu iş arkada nasıl çalışıyor" sorusunu anlamak için mükemmel bir temel kütüphanedir.

**Konuşmacı Notu:** Sonuç olarak mikroservis iletişiminde "tek bir doğru" yoktur. Projenizin reaktif mi yoksa senkron mu olacağı, Spring ekosistemine ne kadar bağımlı olmak istediğiniz gibi faktörler seçeceğiniz Client teknolojisini belirler. Dinlediğiniz için teşekkür ederim, sorularınız varsa alabilirim.
