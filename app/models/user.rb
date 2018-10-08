class User < ApplicationRecord
  has_many :friendships
  has_many :friends, through: :friendships, dependent: :destroy
  has_many :inverse_friendships, class_name: "Friendship", foreign_key: "friend_id"
  has_many :inverse_friends, through: :inverse_friendships, source: :user
  after_create :create_short_url
  after_create :get_topics

  def all_friendships
    (self.friends + self.inverse_friends).uniq
  end

  def connection(user)
    if user.all_friendships.include?(self)
      " is already your friend."
    else
      degrees_of_separation(user)
    end
  end

  #refactor to remove 2 if/else statements to return nil 
  def degrees_of_separation(user)
    friends = user.all_friendships & self.all_friendships
    if friends.present?
      "#{friends.map(&:name).join(', or ')} knows "
    else
       "There are no friends with 2 degrees of separation with "
    end
  end

  private

  def create_short_url
    Users::Shorten.get_short_url(user: self)
  end

  def get_topics
    Users::Info.get_topics(user: self)
  end

end
