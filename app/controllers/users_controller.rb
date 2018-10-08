class UsersController < ApplicationController

  def index
    @user = User.new
    @users = User.all
  end

  def show
    @user = User.find(params[:id])
    @friends = @user.all_friendships.delete(@user)
    @people = User.all - @user.all_friendships

    if params[:search]
      @users = User.where("topics Ilike ?", "%#{params[:search]}%")
    else
      @users = []
    end
  end

  def new
    @user = User.new
  end

  def create
    @user = User.new(user_params)

    respond_to do |format|
      if @user.save
        format.html { redirect_to @user, notice: 'User was successfully created.' }
        format.json { render :show, status: :created, location: @user }
      else
        format.html { render :new }
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
  end

  def destroy
  end

  private

  def user_params
    params.require(:user).permit(:name, :website_url)
  end

end
