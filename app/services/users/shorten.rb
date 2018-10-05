module Users
  class Shorten

    #move to resque background task
    def self.get_short_url(user: nil)
      begin
        url = Google::UrlShortener::Url.new(long_url: user.website_url).shorten!

        user.update! short_url: url.short_url
      rescue
        user.update! short_url: nil
      end
      
      #update api key with google config
      url = RestClient.post "https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyCPt15Fh2pEJajyBp7r8gcwbOZ8p-qiwLc", "{"longUrl":"http://www.justinmckelvey.com"}", "Accept"=>"application/json", "Accept-Encoding"=>"gzip, deflate", "Content-Length"=>"48", "Content-Type"=>"application/json"
    end

  end
end
